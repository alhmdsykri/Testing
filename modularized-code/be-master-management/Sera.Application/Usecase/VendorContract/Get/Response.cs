namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetVendorContractResponse
    {
        public int vendorContractId { get; set; }
        public string vendorContractNumber { get; set; }
        private string vendorcontractype { get; set; }
        public string vendorContractType
        {
            get
            {
                return vendorcontractype;
            }
            set
            {
                if (value == "01")
                {
                    value = "Unit";
                }
                if (value == "02")
                {
                    value = "Driver";
                }
                if (value == "03")
                {
                    value = "Unit & Driver";
                }

                this.vendorcontractype = value;
            }
        }
        public string businessUnitName { get; set; }
        public string status { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
    }
}