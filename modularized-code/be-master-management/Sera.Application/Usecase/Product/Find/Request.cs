namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindProductRequest : IRequest<Response<IEnumerable<FindProductResponse>>>
    {
        public string? productSearch { get; set; } = string.Empty;

        public SearchProductBy productSearchBy { get; set; }

        [DefaultValue(CommonConst.MIN_PAGE)]
        public int page { get; set; } = CommonConst.MIN_PAGE;

        [DefaultValue(CommonConst.MIN_ROW)]
        public int row { get; set; } = CommonConst.MIN_ROW;

        [DefaultValue("DESC")]
        public Order orderBy { get; set; } = Order.DESC;

        [DefaultValue("modifiedAt")]
        public SortProduct? sortBy { get; set; } = SortProduct.modifiedAt;       
    }
    public enum SearchProductBy
    {
        productName = 1,
        businessUnitCode = 2,
        businessUnitName = 3,
        productType = 4,
        productStatus = 5,
        modifiedAt = 6,
        journeyTypeId = 7
    }
    public enum SortProduct
    {
        productType = 1,
        productStatus = 2,
        modifiedAt = 3
    }
    public enum ProductStatus
    {
        Active = 1,
        Inactive = 0
    }
    public enum ProductTypeId
    {
        Logistic = 1,
        Transport = 2,
        Expedition = 3
    }
}