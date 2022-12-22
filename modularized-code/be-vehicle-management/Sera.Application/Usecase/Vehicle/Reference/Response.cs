namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetVehicleReferenceResponse
    {
        public int brandId { get; set; }
        public string brandCode { get; set; }
        public string brandName { get; set; }
        public int categoryId { get; set; }
        public string categoryCode { get; set; }
        public string categoryName { get; set; }
        public int colorId { get; set; }
        public string colorCode { get; set; }
        public string colorName { get; set; }
        public int modelId { get; set; }
        public string modelCode { get; set; }
        public string modelName { get; set; }
        public int fuelTypeId { get; set; }
        public string fuelTypeCode { get; set; }
        public string fuelTypeName { get; set; }
    }
}