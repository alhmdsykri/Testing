namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetContractItemResponse
    {
        public bool? isB2B { get; set; }
        public string materialCode { get; set; }
        public string materialName { get; set; }
        public int lineItemNumber { get; set; }
        public int numberOfDriver { get; set; }
        public decimal quantity { get; set; }
        public string UOMCode { get; set; }
        public string branchCode { get; set; }
        public string branchName { get; set; }
        public string fuel { get; set; }
        public string tollAndParking { get; set; }
        public string channelType { get; set; }
        public string coverageArea { get; set; }
        public string crew { get; set; }
        public string helperIncluded { get; set; }
        public string reportIncluded { get; set; }
        public string UJPIncluded { get; set; }
    }
}