namespace Sera.Application.Persistor
{
    public class UpdateRouteDetailFMSHandler : BaseHandler,
                                         IRequestHandler<UpdateRouteDetailRequest, IResultStatus>
    {
        public UpdateRouteDetailFMSHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(UpdateRouteDetailRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            //SPLIT STRING FOR CODE AND NAME
            char[] delimiterChars = { '-', '\t' };
            string? customerCode = null;
            string? customerName = null;
            int? returnRouteCode = null;
            string? returnRouteName = null;

            if (!string.IsNullOrWhiteSpace(request.data.customerName))
            {
                string[] customerCodeName = request.data.customerName.Split(delimiterChars);
                customerName = customerCodeName[0]; //DEFAULT, THERE IS NO BU CODE, ONLY BU NAME

                if (customerCodeName.Length > 1 && customerCodeName.Length <= 2)
                {
                    customerCode = customerCodeName[0];
                    customerName = customerCodeName[1]; //DEFAULT

                    if (customerCodeName.Length >= 3) //NOT FEASIBLE, THERE IS A POSSIBILITY THE CODE CONSIST OF 4 CHARS
                    {
                        customerCode = null;
                        customerName = $"{customerCodeName[1]} - {customerCodeName[2]}";
                    }
                }

                if (customerCodeName.Length >= 3)
                {
                    customerCode = customerCodeName[0];
                    customerName = $"{customerCodeName[1]} - {customerCodeName[2]}"; //NOT FEASIBLE, THERE IS A POSSIBILITY BU NAME CONSIST OF MORE THAN 1 DASH (-) CHARS
                }
            }

            if (!string.IsNullOrWhiteSpace(request.data.returnRouteName))
            {
                string[] returnRouteCodeName = request.data.returnRouteName.Split(delimiterChars);
                returnRouteName = returnRouteCodeName[0]; //DEFAULT, THERE IS NO BU CODE, ONLY BU NAME

                if (returnRouteCodeName.Length > 1 && returnRouteCodeName.Length <= 2)
                {
                    returnRouteCode = int.Parse(returnRouteCodeName[0]);
                    returnRouteName = returnRouteCodeName[1]; //DEFAULT

                    if (returnRouteCodeName.Length >= 3) //NOT FEASIBLE, THERE IS A POSSIBILITY THE CODE CONSIST OF 4 CHARS
                    {
                        returnRouteCode = null;
                        returnRouteName = $"{returnRouteCodeName[1]} - {returnRouteCodeName[2]}";
                    }
                }

                if (returnRouteCodeName.Length >= 3)
                {
                    returnRouteCode = int.Parse(returnRouteCodeName[0]);
                    returnRouteName = $"{returnRouteCodeName[1]} - {returnRouteCodeName[2]}"; //NOT FEASIBLE, THERE IS A POSSIBILITY BU NAME CONSIST OF MORE THAN 1 DASH (-) CHARS
                }
            }

            var entity = await dbContext.Route.FindAsync(request.data.routeId);

            if (entity == null)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }
            
            entity.customerId = request.data.customerId;
            entity.customerCode = customerCode == null ? null : customerCode.Trim();
            entity.customerName = customerName == null ? null : customerName.Trim();
            entity.contractNumber = request.data.contractNumber;
            entity.returnRouteId = request.data.returnRouteId;
            entity.returnRouteCode = returnRouteCode;
            entity.returnRouteName = returnRouteName == null ? null : returnRouteName.Trim();
            entity.modifiedBy = request.username;
            entity.modifiedAt = DateTime.UtcNow;
            entity.status = (int)EventStatus.COMPLETED;

            if (request.data.customerId != null || request.data.contractNumber != null || request.data.returnRouteId != null)
            {
                entity.completionStatus = (int)CompletionStatus.INPROGRESS;
            }

            if (request.data.customerId != null && request.data.contractNumber != null && request.data.returnRouteId != null)
            {
                entity.completionStatus = (int)CompletionStatus.COMPLETED;
            }

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            #region SEND MESSAGE TO SERVICE BUS TO CREATE EVENT SOURCE STATUS
            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = request.entity,
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                status = (int)EventStatus.COMPLETED,
                username = request.username,
                transactionId = request.transactionId,
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            #region SEND MESSAGE TO SERVICE BUS FIREBASE
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}