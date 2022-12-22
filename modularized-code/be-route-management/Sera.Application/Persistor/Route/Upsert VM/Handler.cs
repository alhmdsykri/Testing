using Mapster;
using Sera.Application.Function;

namespace Sera.Application.Persistor
{
    public class RouteCreationHandler : BaseHandler,
                                        IRequestHandler<FleetXRouteRequest, IResultStatus>
    {
        public RouteCreationHandler(IDbContext dbContext, IMessage message, IRESTClient client)
               : base(dbContext, message, client)
        { }

        public async Task<IResultStatus> Handle(FleetXRouteRequest request,
                                                CancellationToken cancellationToken)
        {
            IResultStatus result = new ResultStatus();

            var dataRoute = dbContext.Route.AsNoTracking()
                                           .FirstOrDefault(x => x.routeCode == request.routeId &&
                                                           x.status == (int)EventStatus.COMPLETED);

            //FACTORY DESIGN PATTERN
            IRouteRepository repo = new CreateRouteRepository(dbContext);

            string routeKML = request.routeKML;
            string routeJSON = request.routeJSON;

            request.routeJSON = string.Empty;
            request.routeKML = string.Empty;

            // IF ROUTE ID is EXISTING
            if (dataRoute != null)
            {
                ServiceBusRequest<string> sbusRequest = new()
                {
                    action = request.action,
                    data = request.Serialize(),
                    entity = AppConst.ROUTE,
                    feURL = string.Empty,
                    filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                    method = HTTPMethod.POST.ToString(),
                    source = "FleetX",
                    startDate = request.startDate,
                    endDate = request.endDate,
                    status = (int)EventStatus.REJECTED,
                    transactionId = request.transactionId,
                    username = request.userId,
                    message = Message.Exist("Route Id")
                };

                List<string> jsonReq = new() { sbusRequest.Serialize() };
                await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                               jsonReq);

                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}, {Message.Exist("Route Id")}");
            }

            #region SEND MESSAGE TO SERVICE BUS COSMOS STATUS 1 FOR ROUTE

            ServiceBusRequest<string> sbsRequest = new()
            {
                action = request.action,
                data = request.Serialize(),
                entity = AppConst.ROUTE,
                feURL = string.Empty,
                filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                method = HTTPMethod.POST.ToString(),
                source = "FleetX",
                startDate = request.startDate,
                endDate = request.endDate,
                status = (int)EventStatus.INPROGRESS,
                transactionId = request.transactionId,
                username = request.userId
            };

            List<string> jsonRequest = new() { sbsRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);

            #endregion

            #region SEND MESSAGE TO SERVICE BUS FIREBASE STATUS 1

            sbsRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
            jsonRequest = new() { sbsRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequest);

            #endregion

            #region HIT API LOCATION BY MULTIPLE LOCATION ID

            var apiLocationResponse = await client.GetLocationByMultipleIdAsync(request.transactionId, request.userId, request.routeWaypoint.locationId);

            if (apiLocationResponse.Status != ResponseStatus.SUCCESS)
            {
                sbsRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
                sbsRequest.status = (int)EventStatus.REJECTED;
                sbsRequest.message = apiLocationResponse.Message;
                jsonRequest = new() { sbsRequest.Serialize() };
                await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                               jsonRequest);

                return result.ReturnErrorStatus($"Transaction Id :{request.transactionId}, Message : {apiLocationResponse.Message}");
            }

            #endregion

            List<int> locationId = request.routeWaypoint.locationId.ToList();
            var locationData = apiLocationResponse.Data.routeWayPoint.OrderBy(x => locationId.IndexOf(x.locationId)).ToList();
            
            request.routeJSON = routeJSON;
            request.routeKML = routeKML;


            result = await repo.SaveChangesAsync(request, cancellationToken);
            int i = 0;
            int seq = 1;

            #region SEND TO SERVICE BUS FOR UPDATE ROUTE LOCATION STATUS 1

            //if (dataRoute != null)
            //{
            //    UpdateRouteLocationModel updateRouteLocationModel = new();
            //    updateRouteLocationModel.routeId = dataRoute.routeId;
            //    updateRouteLocationModel.routeCode = dataRoute.routeCode;
            //    updateRouteLocationModel.routeName = dataRoute.routeName;
            //    updateRouteLocationModel.routeJSON = dataRoute.routeJSON;
            //    updateRouteLocationModel.routeKML = dataRoute.routeKML;
            //    updateRouteLocationModel.departurePoolId = dataRoute.departurePoolId;
            //    updateRouteLocationModel.departurePoolCode = dataRoute.departurePoolCode;
            //    updateRouteLocationModel.departurePoolName = dataRoute.departurePoolName;
            //    updateRouteLocationModel.returnRouteId = dataRoute.returnRouteId;
            //    updateRouteLocationModel.returnRouteCode = dataRoute.returnRouteCode;
            //    updateRouteLocationModel.returnRouteName = dataRoute.returnRouteName;
            //    updateRouteLocationModel.lastUpdate = dataRoute.lastUpdate;
            //    updateRouteLocationModel.customerId = dataRoute.customerId;
            //    updateRouteLocationModel.customerCode = dataRoute.customerCode;
            //    updateRouteLocationModel.customerName = dataRoute.customerName;
            //    updateRouteLocationModel.contractNumber = dataRoute.contractNumber;
            //    updateRouteLocationModel.completionStatus = dataRoute.completionStatus;
            //    updateRouteLocationModel.arrivalPoolId = dataRoute.arrivalPoolId;
            //    updateRouteLocationModel.arrivalPoolCode = dataRoute.arrivalPoolCode;
            //    updateRouteLocationModel.arrivalPoolName = dataRoute.arrivalPoolName;
            //    updateRouteLocationModel.businessUnitId = dataRoute.businessUnitId;
            //    updateRouteLocationModel.contractId = dataRoute.contractId;
            //    updateRouteLocationModel.routeLocation = new();

            //    foreach (var item in locationData)
            //    {
            //        RouteLocationModelForUpdate entity = new();
            //        entity.locationId = item.locationId;
            //        entity.locationCode = item.locationCode;
            //        entity.locationName = item.locationName;
            //        entity.locationTypeId = item.locationTypeId;
            //        entity.longitude = item.longitude;
            //        entity.latitude = item.latitude;
            //        entity.branchId = item.branchId;
            //        entity.branchCode = item.branchCode;
            //        entity.branchName = item.branchName;
            //        entity.timezone = request.routeWaypoint.timezone[i];
            //        entity.distanceToNextLocation = request.routeWaypoint.distanceToNextLocation[i];
            //        entity.sequenceNumber = seq;

            //        updateRouteLocationModel.routeLocation.Add(entity);
            //        seq++;
            //        i++;
            //    }

            //    #region INSERT TO COSMOS EVENT HISTORY

            //    ServiceBusRequest<string> sbsUpdateRouteLocationEventRequest = new()
            //    {
            //        action = AppConst.FA_ACTION_PUT_ROUTE_LOCATION,
            //        data = updateRouteLocationModel.Serialize(),
            //        entity = "Route Location",
            //        feURL = string.Empty,
            //        filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
            //        method = HTTPMethod.PUT.ToString(),
            //        source = "FleetX",
            //        startDate = request.startDate,
            //        endDate = request.endDate,
            //        status = (int)EventStatus.INPROGRESS,
            //        transactionId = request.transactionId,
            //        username = request.userId
            //    };

            //    List<string> jsonUpdateRouteLocationEventRequest = new() { sbsUpdateRouteLocationEventRequest.Serialize() };
            //    await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
            //                                   CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
            //                                   jsonUpdateRouteLocationEventRequest);

            //    #endregion

            //    #region SEND TO SBS MSSQL PERSISTOR

            //    ServiceBusRequest<UpdateRouteLocationModel> sbsUpdateRouteLocationRequest = new()
            //    {
            //        action = AppConst.FA_ACTION_PUT_ROUTE_LOCATION,
            //        data = updateRouteLocationModel,
            //        entity = "Route Location",
            //        feURL = string.Empty,
            //        filter = CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
            //        method = HTTPMethod.PUT.ToString(),
            //        source = "FleetX",
            //        startDate = request.startDate,
            //        endDate = request.endDate,
            //        status = (int)EventStatus.INPROGRESS,
            //        transactionId = request.transactionId,
            //        username = request.userId
            //    };

            //    List<string> jsonUpdateRouteLocationRequest = new() { sbsUpdateRouteLocationRequest.Serialize() };
            //    await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
            //                                   CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
            //                                   jsonUpdateRouteLocationRequest);

            //    #endregion

            //    return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
            //}

            #endregion

            #region SEND TO SERVICE BUS FOR INSERT ROUTE LOCATION STATUS 1

            var newRouteData = dbContext.Route.AsNoTracking()
                                              .FirstOrDefault(x => x.routeCode == request.routeId);

            CreateRouteLocationModel createRouteLocationModel = request.Adapt<CreateRouteLocationModel>();
            createRouteLocationModel.routeId = newRouteData.routeId;
            createRouteLocationModel.routeLocation = new();
            createRouteLocationModel.routeKML = string.Empty;
            createRouteLocationModel.routeJSON = string.Empty;

            foreach (var item in locationData)
            {
                RouteLocationModel entity = new();
                entity.locationId = item.locationId;
                entity.locationCode = item.locationCode;
                entity.locationName = item.locationName;
                entity.locationTypeId = item.locationTypeId;
                entity.longitude = item.longitude;
                entity.latitude = item.latitude;
                entity.branchId = item.branchId;
                entity.branchCode = item.branchCode;
                entity.branchName = item.branchName;
                entity.timezone = request.routeWaypoint.timezone[i];
                entity.distanceToNextLocation = request.routeWaypoint.distanceToNextLocation[i];
                entity.sequenceNumber = seq;

                createRouteLocationModel.routeLocation.Add(entity);
                i++;
                seq++;
            }

            #region INSERT TO COSMOS EVENT HISTORY

            ServiceBusRequest<string> sbsCreateRouteLocationEventRequest = new()
            {
                action = AppConst.FA_ACTION_POST_ROUTE_LOCATION,
                data = createRouteLocationModel.Serialize(),
                entity = AppConst.ROUTE_LOCATION,
                feURL = string.Empty,
                filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                method = HTTPMethod.POST.ToString(),
                source = "FleetX",
                startDate = request.startDate,
                endDate = request.startDate,
                status = (int)EventStatus.INPROGRESS,
                transactionId = request.transactionId,
                username = request.userId
            };

            List<string> jsonCreateRouteLocationEventRequest = new() { sbsCreateRouteLocationEventRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonCreateRouteLocationEventRequest);

            #endregion

            #region SEND TO SBS MSSQL PERSISTOR

            ServiceBusRequest<CreateRouteLocationModel> sbsCreateRouteLocationRequest = new()
            {
                action = AppConst.FA_ACTION_POST_ROUTE_LOCATION,
                data = createRouteLocationModel,
                entity = "Route Location",
                feURL = string.Empty,
                filter = CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                method = HTTPMethod.POST.ToString(),
                source = "FleetX",
                startDate = request.startDate,
                endDate = request.endDate,
                status = (int)EventStatus.INPROGRESS,
                transactionId = request.transactionId,
                username = request.userId
            };

            List<string> jsonCreateRouteLocationRequest = new() { sbsCreateRouteLocationRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonCreateRouteLocationRequest);

            #endregion

            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}
