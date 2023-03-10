namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class CreateProductRequest : IRequest<Response>
    {
        public string productName { get; set; }
        public int businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public byte productTypeId { get; set; }
        public byte journeyTypeId { get; set; }
        public bool isExpedition { get; set; } = false;
        public string? expeditionId { get; set; }
        public bool isAssignedToVehicle { get; set; } = false;
        public bool isAssignedToDriver { get; set; } = false;
        public byte driverExpensePreTripId { get; set; }
        public byte driverExpensePostTripId { get; set; }
        public bool isReconcilation { get; set; }
        public bool hasProofOfDelivery { get; set; }

    }

}
