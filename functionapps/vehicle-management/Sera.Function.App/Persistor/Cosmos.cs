namespace Sera.Function.App
{
    public class CosmosPersistorFunction
    {
        private readonly ILogger logger;
        private readonly IMediator mediator;

        public CosmosPersistorFunction(ILoggerFactory logger, IMediator mediator)
        {
            this.logger = logger.CreateLogger<CosmosPersistorFunction>();
            this.mediator = mediator;
        }

        [Function("sbtVehiclePersistEvent")]
        public async Task Run([ServiceBusTrigger(AppConst.COSMOS_VEHICLE_TOPIC_NAME,
                                                 AppConst.COSMOS_VEHICLE_SUBS_NAME,
                                                 Connection = CommonConst.FA_SERVICE_BUS_SETTING_NAME)] string message)
        {
            logger.LogInformation(
                $"Service Bus topic {AppConst.COSMOS_VEHICLE_TOPIC_NAME}, subscription {AppConst.COSMOS_VEHICLE_SUBS_NAME} trigger function processed message: {message}");

            if (string.IsNullOrEmpty(message))
            {
                logger.LogInformation(Message.Empty("message"));
            }

            IRequest<IResultStatus> request =
                message.Deserialize<Persistor.CreateCosmosRequest>();
            IResultStatus result = new ResultStatus();

            if (request == null)
            {
                logger.LogInformation(Message.InvalidEvent());
            }

            result = await mediator.Send(request);
            logger.LogInformation(result.Message);
        }
    }
}
