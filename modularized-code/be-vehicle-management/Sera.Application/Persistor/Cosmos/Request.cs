namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class CreateCosmosRequest : ServiceBusRequest<string>, IRequest<IResultStatus>
    { }
}