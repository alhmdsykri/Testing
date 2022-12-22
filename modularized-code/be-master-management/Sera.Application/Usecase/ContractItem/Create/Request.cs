namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class CreateContractItemRequest : IRequest<Response>
    {
        public int contractId { get; set; }
        public List<ContractItemModel> contractItem { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class ContractItemModel
    {
        public int materialId { get; set; }
        public String materialCode { get; set; }
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
