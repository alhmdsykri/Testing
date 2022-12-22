namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindProductResponse
    {
        public int productId { get; set; }
        public string productName { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public string productType { get; set; }
        public string productStatus { get; set; }
        public DateTime? deletedAt { get; set; }
        public DateTime? modifiedAt { get; set; }
    }
}