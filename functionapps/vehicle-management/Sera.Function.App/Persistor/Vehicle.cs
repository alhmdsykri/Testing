namespace Sera.Function.App
{
    public class VehiclePersistorFunction
    {
        private readonly ILogger logger;
        private readonly IMediator mediator;

        public VehiclePersistorFunction(ILoggerFactory logger, IMediator mediator)
        {
            this.logger = logger.CreateLogger<VehicleTypePersistorFunction>();
            this.mediator = mediator;
        }

        [Function("sbtVehiclePersistVehicle")]
        public async Task Run([ServiceBusTrigger(AppConst.VEHICLE_PERSISTOR_NAME,
                                                 AppConst.VEHICLE_PERSISTOR_SUBS_NAME,
                                                 Connection = CommonConst.FA_SERVICE_BUS_SETTING_NAME)] string message)
        {
            logger.LogInformation(
                $"Service Bus topic {AppConst.VEHICLE_PERSISTOR_NAME}, subscription {AppConst.VEHICLE_PERSISTOR_SUBS_NAME} trigger function processed message: {message}");

            ServiceBusRequest baseReq = message.Deserialize<ServiceBusRequest>();
            IRequest<IResultStatus> request = null;

            if (baseReq.method.IsEqual(EventMethod.CREATE.ToString()))
            {
                request = message.Deserialize<Persistor.CreateVehicleRequest>();
            }

            if (baseReq.method.IsEqual(EventMethod.UPDATE.ToString()))
            {
                request = message.Deserialize<Persistor.UpdateVehicleRequest>();
            }

            if (baseReq.method.IsEqual(EventMethod.DELETE.ToString()))
            {
                request = message.Deserialize<Persistor.DeleteVehicleRequest>();
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
