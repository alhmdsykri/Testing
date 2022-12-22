﻿using System.Linq;

namespace Sera.Application.Persistor
{
    public class UpdateProductVehicleTypeStatusHandler : BaseHandler,
                                              IRequestHandler<UpdateProductVehicleTypeStatusRequest, IResultStatus>
    {
        public UpdateProductVehicleTypeStatusHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(UpdateProductVehicleTypeStatusRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region UPDATE TO STATUS PRODUCT VEHICLE TYPE STATUS

            var entityProductVehicleType = await dbContext.ProductVehicleType
                                         .Where(x => request.data.Select(y=> y.productVehicleTypeId).Contains(x.productVehicleTypeId))
                                         .ToListAsync();

            if(entityProductVehicleType.Count > 0)
            {
                entityProductVehicleType.ForEach(x =>
                {
                    x.status = (int)EventStatus.COMPLETED;
                    x.modifiedAt = DateTime.Now;
                    x.modifiedBy = request.username;
                    x.transactionId = request.transactionId;
                });

                if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
                {
                    return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
                }

            }

            #endregion

            #region SEND MESSAGE TO SERVICE BUS TO CREATE ROUTE EVENT SOURCE PRODUCT VEHILCE TYPE STATUS 2

            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = AppConst.PRODUCT_VEHICLE_TYPE,
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

            List<string> jsonRequestEvent = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequestEvent);

            #endregion

            #region SEND MESSAGE TO SERVICE BUS FIREBASE STATUS 2

            sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequest);

            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}
