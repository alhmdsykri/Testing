namespace Sera.Application.Persistor
{
    public class DeleteRouteLocationHandler : BaseHandler,
                                         IRequestHandler<DeleteRouteLocationRequest, IResultStatus>
    {
        public DeleteRouteLocationHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(DeleteRouteLocationRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region SEND MESSAGE TO SERVICE BUS EVENT HISTORY (IN-PROGRESS)
            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = "Route Location",
                feURL = string.Empty,
                method = HTTPMethod.DELETE.ToString(),
                filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                source = "FleetX",
                status = (int)EventStatus.INPROGRESS,
                username = request.username,
                transactionId = request.transactionId
            };
            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            #region UPDATE MSSQL (IN-PROGRESS)
            var entity = dbContext.RouteLocation
                                  .Where(x => x.routeId == request.data.routeId)
                                  .ToList();

            if (entity == null)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            foreach (var item in entity)
            {
                item.modifiedBy = request.username;
                item.modifiedAt = DateTime.UtcNow;
                item.status = (int)EventStatus.DELETED;
                item.transactionId = request.transactionId;
            }            

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }
            #endregion

            #region SEND MESSAGE TO SERVICE BUS EVENT HISTORY (DELETED)
            DeleteRouteRequest deleteRouteRequest = new();
            deleteRouteRequest.transactionId = request.transactionId;
            deleteRouteRequest.action = AppConst.FA_ACTION_DELETE_ROUTE_FMS;
            deleteRouteRequest.userId = request.username;

            DeleteRouteModel deleteRouteModel = new();
            deleteRouteModel.routeId = request.data.routeId;
            deleteRouteModel.routeCode = request.data.routeCode;
            deleteRouteModel.routeName = request.data.routeName;
            deleteRouteModel.status = (int)EventStatus.DELETED;
            deleteRouteRequest.deleteRoute = deleteRouteModel;

            sbusRequest.data = deleteRouteRequest.Serialize();
            sbusRequest.status = (int)EventStatus.DELETED;

            jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            #region SEND MESSAGE TO SERVICE BUS ROUTE FINAL
            List<string> jsonRouteFinalRequest = new() { deleteRouteRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRouteFinalRequest);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}
