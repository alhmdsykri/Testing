namespace Sera.Application.Persistor.DLQ
{
    public class RouteLocationDLQCreateHandler : BaseHandler,
                                                 IRequestHandler<RouteLocationDLQCreateRequest, IResultStatus>
    {
        public RouteLocationDLQCreateHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(RouteLocationDLQCreateRequest request,
                                                CancellationToken cancellationToken)
        {
            IResultStatus result = new ResultStatus();

            #region Hard Remove Data Route

            dbContext.Route.Remove(dbContext.Route.Single(x => x.routeId == request.data.routeId));
            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            #endregion

            #region SEND NOTIFICATION TO FIREBASE STATUS 3

            ServiceBusRequest<string> sbsRequest = new()
            {
                action = request.action,
                data = request.Serialize(),
                entity = "Route Location",
                feURL = string.Empty,
                filter = string.Empty,
                method = HTTPMethod.POST.ToString(),
                source = "FleetX",
                startDate = request.startDate,
                endDate = request.endDate,
                status = (int)EventStatus.FAIL,
                transactionId = request.transactionId,
                username = request.username
            };

            List<string> jsonRequest = new() { sbsRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequest);

            #endregion

            return result.ReturnSuccessStatus();
        }
    }
}
