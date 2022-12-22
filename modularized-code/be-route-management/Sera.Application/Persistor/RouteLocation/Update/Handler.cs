using System.Transactions;

namespace Sera.Application.Persistor
{
    public class UpdateRouteLocationHandler : BaseHandler,
                                              IRequestHandler<UpdateRouteLocationRequest, IResultStatus>
    {
        public UpdateRouteLocationHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(UpdateRouteLocationRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region COMPARISON EXISTING LOCATION ID WITH NEW LOCATION ID

            var existlocationId = dbContext.RouteLocation.Where(x => x.routeId == request.data.routeId &&
                                                                 x.status == (int)EventStatus.COMPLETED)
                                                         .Select(x => x.locationId)
                                                         .ToList().ToArray();
            List<int> newLocationId = new();
            foreach (var item in request.data.routeLocation)
            {
                newLocationId.Add(item.locationId);
            }

            var insertLocationId = newLocationId.Except(existlocationId).ToList();
            var updateLocationId = newLocationId.Intersect(existlocationId).ToList();
            var deleteLocationId = existlocationId.Except(newLocationId).ToList();

            #endregion

            #region INSERT UPDATE DELETE ROUTE LOCATION

            TransactionOptions options = new TransactionOptions();
            options.IsolationLevel = IsolationLevel.ReadCommitted;
            using (TransactionScope scope = new TransactionScope(TransactionScopeOption.Required, options,
                                                                 TransactionScopeAsyncFlowOption.Enabled))
            {
                if (insertLocationId.Count() >= 1)
                {
                    var data = request.data.routeLocation.Where(x => insertLocationId.Contains(x.locationId));

                    List<SQL.RouteLocation> listData = new();
                    foreach (var item in data)
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
                        entity.sequenceNumber = item.sequenceNumber;
                        entity.timezone = item.timezone;
                        entity.distanceToNextLocation = item.distanceToNextLocation;
                        entity.status = (int)EventStatus.COMPLETED;
                        entity.version = AppConst.DATA_VERSION;
                        entity.createdBy = request.username;
                        entity.createdAt = DateTime.UtcNow;
                        entity.modifiedBy = request.username;
                        entity.modifiedAt = DateTime.UtcNow;

                        listData.Add(entity);
                    }

                    await dbContext.RouteLocation.AddRangeAsync(listData, cancellationToken);
                    await dbContext.SaveChangesAsync(cancellationToken);
                }

                if (updateLocationId.Count() >= 1)
                {
                    var data = request.data.routeLocation.Where(x => updateLocationId.Contains(x.locationId))
                                                         .OrderByDescending(x => x.locationId)
                                                         .ToList();
                    var entity = dbContext.RouteLocation.Where(x => updateLocationId.Contains(x.locationId) &&
                                                               x.status == (int)EventStatus.COMPLETED)
                                                        .OrderByDescending(x => x.locationId)
                                                        .ToList();
                    int i = 0;
                    foreach (var item in data)
                    {
                        entity[i].locationId = item.locationId;
                        entity[i].locationCode = item.locationCode;
                        entity[i].locationName = item.locationName;
                        entity[i].locationTypeId = item.locationTypeId;
                        entity[i].longitude = item.longitude;
                        entity[i].latitude = item.latitude;
                        entity[i].branchId = item.branchId;
                        entity[i].branchCode = item.branchCode;
                        entity[i].branchName = item.branchName;
                        entity[i].sequenceNumber = item.sequenceNumber;
                        entity[i].timezone = item.timezone;
                        entity[i].distanceToNextLocation = item.distanceToNextLocation;
                        entity[i].modifiedAt = DateTime.UtcNow;
                        entity[i].modifiedBy = request.username;
                        entity[i].status = (int)EventStatus.COMPLETED;

                        i++;
                    }
                    await dbContext.SaveChangesAsync(cancellationToken);
                }

                if (deleteLocationId.Count() >= 1)
                {
                    var entity = dbContext.RouteLocation.Where(x => deleteLocationId.Contains(x.locationId) &&
                                                               x.status == (int)EventStatus.COMPLETED)
                                                        .ToList();
                    entity.ForEach(x =>
                    {
                        x.status = (int)EventStatus.DELETED;
                        x.modifiedAt = DateTime.UtcNow;
                        x.modifiedBy = request.username;
                    });

                    await dbContext.SaveChangesAsync(cancellationToken);
                }

                scope.Complete();
            }

            #endregion

            #region SEND MESSAGE SERVICE BUS

            #region SEND MESSAGE TO SERVICE BUS TO CREATE ROUTE EVENT SOURCE STATUS 2

            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = "Route",
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                status = (int)EventStatus.COMPLETED,
                username = request.username,
                transactionId = request.transactionId,
                startDate = request.startDate,
                endDate = request.endDate,
                action = request.action,
                filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);

            #endregion

            #region SEND MESSAGE TO SERVICE BUS TO CREATE ROUTE LOCATION EVENT SOURCE STATUS 2

            sbusRequest.entity = "Route Location";
            jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);

            #endregion

            #region SEND MESSAGE TO SERVICE BUS FIREBASE STATUS 2

            sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
            jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequest);

            #endregion

            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}