namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetBUResponse
    {
        public int businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public short companyId { get; set; }
        public string companyCode { get; set; }
        public string companyName { get; set; }
        public bool sapIntegrated { get; set; }
    }
}
