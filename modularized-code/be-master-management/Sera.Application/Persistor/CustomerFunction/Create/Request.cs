namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class CreateCustomerFunctionRequest :
        ServiceBusRequest<CreateCustomerFunctionModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class CreateCustomerFunctionModel
    {
        public int customerContactId { get; set; }
        public string functionName { get; set; }
    }
    
}
