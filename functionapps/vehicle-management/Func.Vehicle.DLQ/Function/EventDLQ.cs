namespace Func.Vehicle.DQL
{
    public class EventDLQProcessorFunction
    {
        private readonly ILogger logger;
        private readonly IMessage message;

        public EventDLQProcessorFunction(ILoggerFactory logger, IMessage message)
        {
            this.logger = logger.CreateLogger<EventDLQProcessorFunction>();
            this.message = message;
        }

        [Function("EventDLQProcessor")]
        public async Task Run([ServiceBusTrigger(AppConst.VEHICLE_SERVICE_BUS_TOPIC_NAME,
                                                 $"{AppConst.VEHICLE_EVENT_SUBS_NAME}/$deadletterqueue",
                                                 Connection = CommonConst.FA_SERVICE_BUS_SETTING_NAME)] string message)
        {
            try
            {
                logger.LogInformation($"Service Bus topic {AppConst.VEHICLE_SERVICE_BUS_TOPIC_NAME}, " +
                                      $"subscription {AppConst.VEHICLE_EVENT_SUBS_NAME} DLQ trigger function processed message: {message}");

                if (string.IsNullOrEmpty(message))
                {
                    logger.LogInformation(Message.Empty("Service bus message"));
                    return;
                }

                var request = message.Deserialize<ServiceBusRequest>();
                var processor = new DLQProcessor(this.message);

                await processor.RequeueDLQ(AppConst.VEHICLE_SERVICE_BUS_TOPIC_NAME, request.filter, message);

                logger.LogInformation($"Message from {AppConst.VEHICLE_EVENT_SUBS_NAME} DLQ has been requeue");
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
