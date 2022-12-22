namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateContractRequest :
        ServiceBusRequest<UpdateContractModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class UpdateContractModel
    {
        public int contractId { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
        public int contractStatus { get; set; }
    }
}
