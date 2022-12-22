namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateProductRequest :
        ServiceBusRequest<UpdateProductModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class UpdateProductModel
    {
        public int productId { get; set; }
        public byte productStatus { get; set; }
        public string productName { get; set; }
        public byte productTypeId { get; set; }
        public byte journeyTypeId { get; set; }
        public bool isExpedition { get; set; }
        public string? expeditionId { get; set; }
        public bool isAssignedToVehicle { get; set; }
        public bool isAssignedToDriver { get; set; }
        public byte driverExpensePreTripId { get; set; }
        public byte driverExpensePostTripId { get; set; }
        public bool isReconcilation { get; set; }
        public bool hasProofOfDelivery { get; set; }
    }
}
