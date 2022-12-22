namespace Sera.Function.App
{
    public class VehicleTypePersistorFunction
    {
        private readonly ILogger logger;
        private readonly IMediator mediator;

        public VehicleTypePersistorFunction(ILoggerFactory logger, IMediator mediator)
        {
            this.logger = logger.CreateLogger<VehicleTypePersistorFunction>();
            this.mediator = mediator;
        }

        [Function("sbtVehicleTypePersistVehicleType")]
        public async Task Run([ServiceBusTrigger(AppConst.VEHICLETYPE_PERSISTOR_NAME,
                                                 AppConst.VEHICLETYPE_PERSISTOR_SUBS_NAME,
                                                 Connection = CommonConst.FA_SERVICE_BUS_SETTING_NAME)] string message)
        {
            logger.LogInformation(
                $"Service Bus topic {AppConst.VEHICLETYPE_PERSISTOR_NAME}, subscription {AppConst.VEHICLETYPE_PERSISTOR_SUBS_NAME} trigger function processed message: {message}");

            ServiceBusRequest baseReq = message.Deserialize<ServiceBusRequest>();
            IRequest<IResultStatus> request = null;

            if (baseReq.method.IsEqual(EventMethod.UPDATE.ToString()))
            {
                request = message.Deserialize<Persistor.UpdateVehicleTypeRequest>();
            }

            IResultStatus response = new ResultStatus();
            if (request == null)
            {
                logger.LogInformation(response.Message);
            }

            response = await mediator.Send(request);

            logger.LogInformation(response.Message);
        }
    }
}
