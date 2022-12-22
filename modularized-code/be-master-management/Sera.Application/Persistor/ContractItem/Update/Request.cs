namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateContractItemRequest :
        ServiceBusRequest<UpdateContractItemModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class UpdateContractItemModel
    {
       
        public int contractId { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
        public int contractStatus { get; set; }
    }
    
}
