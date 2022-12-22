namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetCompanyValidation : AbstractValidator<GetCompanyRequest>
    {
        public GetCompanyValidation()
        {
            RuleFor(x => x.companyId).NotEmpty();
        }
    }
}
