namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindContractItemResponse
    {
        public int customerContractItemId { get; set; }
        public string materialCode { get; set; }
        public string materialName { get; set; }
        public string vehicleTypeCode { get; set; }
        public string vehicleTypeName { get; set; }
        public int lineItemNumber { get; set; }
        public int numberOfDriver { get; set; }
        public decimal quantity { get; set; }
        public string UOMCode { get; set; }
        public string branchCode { get; set; }
        public string branchName { get; set; }
    }
}