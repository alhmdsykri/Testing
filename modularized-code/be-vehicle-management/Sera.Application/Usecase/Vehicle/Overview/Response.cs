namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetOverviewVehicleResponse
    {
        public int vehicleTypeId { get; set; }
        public int totalUnit { get; set; }
        public int unitFree { get; set; }
        public int onContract { get; set; }
        public int onDuty { get; set; }
        public int breakdown { get; set; }
        public int unavailable { get; set; }
        public int missing { get; set; }
    }
}
