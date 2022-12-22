namespace Func.Vehicle.Firebase
{
    public class FunctionFirebase
    {
        private readonly ILogger logger;
        private readonly IMediator mediator;

        public FunctionFirebase(ILoggerFactory logger, IMediator mediator)
        {
            this.logger = logger.CreateLogger<FunctionFirebase>();
            this.mediator = mediator;
        }

        [Function("FirebasePersistor")]
        public async Task Run([ServiceBusTrigger(AppConst.VEHICLE_SERVICE_BUS_TOPIC_NAME,
                                                 AppConst.VEHICLE_FIREBASE_SUBS_NAME,
                                                 Connection = CommonConst.FA_SERVICE_BUS_SETTING_NAME)] string message)
        {
            try
            {
                logger.LogInformation($"Service Bus topic {AppConst.VEHICLE_SERVICE_BUS_TOPIC_NAME}, " +
                                      $"subscription {AppConst.VEHICLE_FIREBASE_SUBS_NAME} trigger function processed message: {message}");

                if (string.IsNullOrEmpty(message))
                {
                    logger.LogInformation(Message.Empty("Service bus message"));
                    return;
                }

                IRequest<IResultStatus> request =
                    message.Deserialize<Sera.Application.Persistor.CreateFirebaseRequest>();
                IResultStatus result = new ResultStatus();

                if (request == null)
                {
                    logger.LogInformation(Message.InvalidEvent());
                }

                result = await mediator.Send(request);
                logger.LogInformation(result.Message);
            }
            catch (Exception ex)
            {
                logger.LogInformation(ex.Message);
                logger.LogInformation(ex.StackTrace);
                throw;
            }
        }
    }
}