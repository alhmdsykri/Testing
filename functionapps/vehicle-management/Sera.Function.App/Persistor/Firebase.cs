namespace Sera.Function.App
{
    public class FirebasePersistorFunction
    {
        private readonly ILogger logger;
        private readonly IMediator mediator;

        public FirebasePersistorFunction(ILoggerFactory logger, IMediator mediator)
        {
            this.logger = logger.CreateLogger<FirebasePersistorFunction>();
            this.mediator = mediator;
        }

        [Function("sbtVehiclePersistFirebase")]
        public async Task Run([ServiceBusTrigger(AppConst.FIREBASE_VEHICLE_TOPIC_NAME,
                                                 AppConst.FIREBASE_VEHICLE_SUBS_NAME,
                                                 Connection = CommonConst.FA_SERVICE_BUS_SETTING_NAME)] string message)
        {
            logger.LogInformation(
                $"Service Bus topic {AppConst.FIREBASE_VEHICLE_TOPIC_NAME}, subscription {AppConst.FIREBASE_VEHICLE_SUBS_NAME} trigger function processed message: {message}");

            if (string.IsNullOrEmpty(message))
            {
                logger.LogInformation(Message.Empty("message"));
            }

            IRequest<IResultStatus> request =
                message.Deserialize<Persistor.CreateFirebaseRequest>();
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