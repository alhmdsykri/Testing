namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class CreateCustomerContactRequest :
        ServiceBusRequest<CreateCustomerContacModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class CreateCustomerContacModel
    {
        public int customerContactId { get; set; }
        public int customerId { get; set; }
        public string contactName { get; set; }
        public string functionName { get; set; }
        public string phoneNumber { get; set; }
        public string email { get; set; }
        public string? position { get; set; }
        public string? departement { get; set; }
        public string? remarks { get; set; }
        public bool isPIC { get; set; }
    }
    
}
