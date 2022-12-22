namespace Func.Vehicle.MSSQL
{
    public class FunctionMSSQL
    {
        private readonly ILogger logger;
        private readonly IMediator mediator;

        public FunctionMSSQL(ILoggerFactory logger, IMediator mediator)
        {
            this.logger = logger.CreateLogger<FunctionMSSQL>();
            this.mediator = mediator;
        }

        [Function("VehiclePersistor")]
        public async Task Run([ServiceBusTrigger(AppConst.VEHICLE_SERVICE_BUS_TOPIC_NAME,
                                                 AppConst.VEHICLE_MSSQL_SUBS_NAME,
                                                 Connection = CommonConst.FA_SERVICE_BUS_SETTING_NAME)] string message)
        {
            try
            {
                logger.LogInformation($"Service Bus topic {AppConst.VEHICLE_SERVICE_BUS_TOPIC_NAME}, " +
                                      $"subscription {AppConst.VEHICLE_MSSQL_SUBS_NAME} trigger function processed message: {message}");

                if (string.IsNullOrEmpty(message))
                {
                    logger.LogInformation(Message.Empty("Service bus message"));
                    return;
                }

                ServiceBusRequest baseReq = message.Deserialize<ServiceBusRequest>();
                IRequest<IResultStatus> request = null;
                IResultStatus result = new ResultStatus();

                if (baseReq.action.IsEqual(AppConst.FA_ACTION_CREATE_VEHICLE))
                {
                    request = message.Deserialize<Sera.Application.Persistor.CreateVehicleRequest>();
                    result = await mediator.Send(request);
                    logger.LogInformation(result.Message);
                    return;
                }

                if (baseReq.action.IsEqual(AppConst.FA_ACTION_UPDATE_VEHICLE))
                {
                    request = message.Deserialize<Sera.Application.Persistor.UpdateVehicleRequest>();
                    result = await mediator.Send(request);
                    logger.LogInformation(result.Message);
                    return;
                }

                if (baseReq.action.IsEqual(AppConst.FA_ACTION_DELETE_VEHICLE))
                {
                    request = message.Deserialize<Sera.Application.Persistor.DeleteVehicleRequest>();
                    result = await mediator.Send(request);
                    logger.LogInformation(result.Message);
                    return;
                }

                if (baseReq.action.IsEqual(AppConst.FA_ACTION_UPDATE_VEHICLE_TYPE))
                {
                    request = message.Deserialize<Sera.Application.Persistor.UpdateVehicleTypeRequest>();
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
