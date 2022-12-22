namespace Sera.Application.Persistor;

public class UpdateStatusAfterCreateRouteLocationRequest : ServiceBusRequest<UpdateStatusAfterCreateRouteLocationRequestModel>, IRequest<IResultStatus>
{ }

public class UpdateStatusAfterCreateRouteLocationRequestModel : CreateRouteLocationModel
{ }