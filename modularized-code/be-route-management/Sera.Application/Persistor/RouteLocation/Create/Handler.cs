using Mapster;
using Sera.Application.Function;

namespace Sera.Application.Persistor
{
    public class CreateRouteLocationHandler : BaseHandler,
                                              IRequestHandler<CreateRouteLocationRequest, IResultStatus>
    {
        public CreateRouteLocationHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(CreateRouteLocationRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region INSERT TO ROUTE LOCATION

            List<SQL.RouteLocation> listData = new();

            foreach (var item in request.data.routeLocation)
            {
                SQL.RouteLocation entity = new();
                entity.routeId = request.data.routeId;
                entity.locationId = item.locationId;
                entity.locationCode = item.locationCode;
                entity.locationName = item.locationName;
                entity.locationTypeId = item.locationTypeId;
                entity.longitude = item.longitude;
                entity.latitude = item.latitude;
                entity.branchId = item.branchId;
                entity.branchCode = item.branchCode;
                entity.branchName = item.branchName;
                entity.timezone = item.timezone;
                entity.distanceToNextLocation = item.distanceToNextLocation;
                entity.sequenceNumber = item.sequenceNumber;
                entity.status = (int)EventStatus.COMPLETED;
                entity.version = AppConst.DATA_VERSION;
                entity.createdBy = request.username;
                entity.createdAt = DateTime.UtcNow;
                entity.modifiedBy = request.username;
                entity.modifiedAt = DateTime.UtcNow;
                entity.transactionId = request.transactionId;

                listData.Add(entity);
            }

            await dbContext.RouteLocation.AddRangeAsync(listData, cancellationToken);

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            #endregion

            #region SEND MESSAGE TO SERVICE BUS TO CREATE ROUTE LOCATION EVENT SOURCE STATUS 2

            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = AppConst.ROUTE_LOCATION,
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                status = (int)EventStatus.COMPLETED,
                username = request.username,
                transactionId = request.transactionId,
                startDate = request.startDate,
                endDate = request.endDate,
                filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                action = request.action
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);

            #endregion

            #region SEND TO SBS MSSQL PERSISTOR - For Route

            var updateStatusAfterCreateRouteLocationRequestModel = request.data.Adapt<UpdateStatusAfterCreateRouteLocationRequestModel>();

            ServiceBusRequest<UpdateStatusAfterCreateRouteLocationRequestModel> sbsCreateRouteLocationRequest = new()
            {
                action = AppConst.FA_ACTION_PUT_ROUTE_STATUS_FROM_CREATE_ROUTE_LOCATION,
                data = updateStatusAfterCreateRouteLocationRequestModel,
                entity = AppConst.ROUTE,
                feURL = string.Empty,
                filter = CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                method = HTTPMethod.POST.ToString(),
                source = "FleetX",
                startDate = request.startDate,
                endDate = request.endDate,
                status = (int)EventStatus.INPROGRESS,
                transactionId = request.transactionId,
                username = request.username
            };

            List<string> jsonCreateRouteLocationRequest = new() { sbsCreateRouteLocationRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonCreateRouteLocationRequest);

            #endregion


            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}
