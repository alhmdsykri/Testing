using System.Transactions;

namespace Sera.Application.Persistor.CQRS.Location
{
    public class CQRSUpdateVehicleHandler : BaseHandler,
                                              IRequestHandler<CQRSUpdateVehicleRequest, IResultStatus>
    {
        public CQRSUpdateVehicleHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(CQRSUpdateVehicleRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region SEND MESSAGE SERVICE BUS  TO CREATE ROUTE & ROUTE LOCATION EVENT SOURCE STATUS 1
            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = "Vehicle",
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                status = (int)EventStatus.INPROGRESS,
                username = request.username,
                transactionId = request.transactionId,
                startDate = DateTime.UtcNow, //[REVISIT]
                endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };

            await message.SendMessageAsync(AppConst.VEHICLE_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            #region UPDATE LOCATION AND CURRENT LOCATION IN VEHICLE
            TransactionOptions options = new TransactionOptions();
            options.IsolationLevel = IsolationLevel.ReadCommitted;
            using (TransactionScope scope = new TransactionScope(TransactionScopeOption.Required, options,
                                                                 TransactionScopeAsyncFlowOption.Enabled))
            {
            
                var entityVehicleLocation =  dbContext.Vehicle
                                  .Where(x => x.locationId == request.data.locationId &&
                                         x.status == (int)EventStatus.COMPLETED)
                                  .ToList();

                entityVehicleLocation.ForEach(x =>
                {
                    x.locationId = request.data.locationId;
                    x.locationName = request.data.locationName;
                    x.modifiedBy = request.username;
                    x.modifiedAt = DateTime.UtcNow;
                    x.status = (int)EventStatus.COMPLETED;
                });

                await dbContext.SaveChangesAsync(cancellationToken);

                var entityVehicleCurrentLocation = dbContext.Vehicle
                                 .Where(x => x.currentLocationId == request.data.locationId &&
                                        x.status == (int)EventStatus.COMPLETED)
                                 .ToList();

                entityVehicleCurrentLocation.ForEach(x =>
                {
                    x.currentLocationId = request.data.locationId;
                    x.currentLocationName = request.data.locationName;
                    x.modifiedBy = request.username;
                    x.modifiedAt = DateTime.UtcNow;
                    x.status = (int)EventStatus.COMPLETED;
                });

                await dbContext.SaveChangesAsync(cancellationToken);

                scope.Complete();
            }
            #endregion

            #region SEND MESSAGE SERVICE BUS TO CREATE ROUTE & ROUTE LOCATION EVENT SOURCE STATUS 2
            sbusRequest.status = (int)EventStatus.COMPLETED;
            jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.VEHICLE_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}