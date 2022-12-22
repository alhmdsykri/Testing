namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class CreateContractItemRequest :
        ServiceBusRequest<CreateContractItemModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class CreateContractItemModel
    {
        public int contractId { get; set; }
        public List<ContractItemModel> contractItem { get; set; }
    }
    
    [ExcludeFromCodeCoverage]
    public class ContractItemModel
    {
        public int materialId { get; set; }
        public decimal quantity { get; set; }
        public String UOMCode { get; set; }
        public int numberOfDriver { get; set; }
        public int? branchId { get; set; }
        public String? branchCode { get; set; }
        public String? branchName { get; set; }
        public String fuel { get; set; }
        public String tollAndParking { get; set; }
    }
}
