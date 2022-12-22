namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetProductResponse
    {        
        public int productId { get; set; }
        public string productCode { get; set; }
        public string productName { get; set; }
        public int businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public int productTypeId { get; set; }
        public int journeyTypeId { get; set; }
        public bool isExpedition { get; set; }
        public string expeditionId { get; set; }
        public bool isAssignedToVehicle { get; set; }
        public bool isAssignedToDriver { get; set; }
        public int driverExpensePreTripId { get; set; }
        public int driverExpensePostTripId { get; set; }
        public bool isReconcilation { get; set; }
        public bool hasProofOfDelivery { get; set; }
        public byte productStatus { get; set; }
    }
}