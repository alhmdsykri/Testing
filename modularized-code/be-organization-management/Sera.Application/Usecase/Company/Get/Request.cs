namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetCompanyRequest : IRequest<Response<GetCompanyResponse>>
    {
        public short companyId { get; set; }
    }
}
