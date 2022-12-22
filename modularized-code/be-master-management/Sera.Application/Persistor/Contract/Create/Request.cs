namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class CreateContractRequest :
         ServiceBusRequest<CreateContractModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class CreateContractModel
    {
        public int customerId { get; set; }
        public int businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
    }
}
