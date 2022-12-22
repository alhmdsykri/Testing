namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]    
    public class UpdateLocationVMModel
    {
        public string locationCode { get; set; }      
        public string locationAddress { get; set; }     
        public int timeOffset { get; set; }
    }
}