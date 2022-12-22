namespace Func.Vehicle.DQL
{
    public class CQRSDLQProcessorFunction
    {
        private readonly ILogger logger;
        private readonly IMessage message;

        public CQRSDLQProcessorFunction(ILoggerFactory logger, IMessage message)
        {
            this.logger = logger.CreateLogger<CQRSDLQProcessorFunction>();
            this.message = message;
        }

        [Function("CQRSDLQProcessor")]
        public async Task Run([ServiceBusTrigger(AppConst.VEHICLE_CQRS_SERVICE_BUS_TOPIC_NAME,
                                                 $"{AppConst.SERVICE_BUS_CQRS_VEHICLE_SUBS_NAME}/$deadletterqueue",
                                                 Connection = CommonConst.FA_SERVICE_BUS_SETTING_NAME)] string message)
        {
            try
            {
                logger.LogInformation($"Service Bus topic {AppConst.VEHICLE_CQRS_SERVICE_BUS_TOPIC_NAME}, " +
                                      $"subscription {AppConst.SERVICE_BUS_CQRS_VEHICLE_SUBS_NAME} DLQ trigger function processed message: {message}");

                if (string.IsNullOrEmpty(message))
                {
                    logger.LogInformation(Message.Empty("Service bus message"));
                    return;
                }

                var request = message.Deserialize<ServiceBusRequest>();
                var processor = new DLQProcessor(this.message);

                await processor.RequeueDLQ(AppConst.VEHICLE_CQRS_SERVICE_BUS_TOPIC_NAME, request.filter, message);

                logger.LogInformation($"Message from {AppConst.SERVICE_BUS_CQRS_VEHICLE_SUBS_NAME} DLQ has been requeue");
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
