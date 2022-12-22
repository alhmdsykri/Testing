namespace Sera.Application.Persistor.CQRS
{
    [ExcludeFromCodeCoverage]
    public class CQRSUpdateCustomerRequest :
        ServiceBusRequest<List<CQRSUpdateCustomer>>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class CQRSUpdateCustomer
    {
        public int customerId { get; set; }
        public string customerCode { get; set; }
        public string customerName { get; set; }
        public int status { get; set; }
    }
}
