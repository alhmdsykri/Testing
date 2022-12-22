namespace Sera.Application.Usecase
{
    public class CheckLocationRequest : IRequest<Response<IEnumerable<CheckLocationResponse>>>
    {
        public List<int> locationId { get; set; }
        public string locationTypeCode { get; set; }
    }
}
