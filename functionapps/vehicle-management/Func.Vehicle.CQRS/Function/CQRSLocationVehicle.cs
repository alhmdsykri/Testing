namespace Func.Vehicle.CQRS.Function
{
    public class FunctionCQRSLocationVehicle
    {
        private readonly ILogger logger;
        private readonly IMediator mediator;

        public FunctionCQRSLocationVehicle(ILoggerFactory logger, IMediator mediator)
        {
            this.logger = logger.CreateLogger<FunctionCQRSLocationVehicle>();
            this.mediator = mediator;
        }

        [Function("CQRSlocationVehiclePersistor")]
        public async Task Run([ServiceBusTrigger(AppConst.VEHICLE_CQRS_SERVICE_BUS_TOPIC_NAME,
                                                 AppConst.SERVICE_BUS_CQRS_VEHICLE_SUBS_NAME,
                                                 Connection = CommonConst.FA_SERVICE_BUS_SETTING_NAME)] string message)
        {
            try
            {
                logger.LogInformation($"Service Bus topic {AppConst.VEHICLE_CQRS_SERVICE_BUS_TOPIC_NAME}, " +
                                      $"subscription {AppConst.SERVICE_BUS_CQRS_VEHICLE_SUBS_NAME} trigger function processed message: {message}");

                if (string.IsNullOrEmpty(message))
                {
                    logger.LogInformation(Message.Empty("Service bus message"));
                    return;
                }

                ServiceBusRequest baseReq = message.Deserialize<ServiceBusRequest>();
                IRequest<IResultStatus> request = null;
                IResultStatus result = new ResultStatus();

                if (baseReq.action.IsEqual(AppConst.FA_ACTION_CQRS_PUT_VEHICLE_LOCATION))
                {
                    request = message.Deserialize<CQRSUpdateVehicleRequest>();
                    result = await mediator.Send(request);
                    logger.LogInformation(result.Message);
                    return;
                }

                logger.LogInformation(Message.InvalidEvent());
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
