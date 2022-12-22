namespace Sera.Application.Persistor.DLQ
{ 
    public class RouteDLQHandler : BaseHandler,
                                   IRequestHandler<RouteDLQRequest, IResultStatus>
    {
        public RouteDLQHandler(IMessage message) :
            base(message)
        { }

        public async Task<IResultStatus> Handle(RouteDLQRequest request,
                                                CancellationToken cancellationToken)
        {
            IResultStatus result = new ResultStatus();

            ServiceBusRequest<string> sbsRequest = new()
            {
                action = request.action,
                data = request.Serialize(),
                entity = "Route",
                feURL = string.Empty,
                filter = string.Empty,
                method = HTTPMethod.POST.ToString(),
                source = "FleetX",
                startDate = request.startDate,
                endDate = request.endDate,
                status = (int)EventStatus.FAIL,
                transactionId = request.transactionId,
                username = request.userId
            };

            List<string> jsonRequest = new() { sbsRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequest);

            return result.ReturnSuccessStatus();
        }
    }
}
