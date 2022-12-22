namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetTopBottomCustomerRequest : IRequest<Response<GetTopBottomCustomerResponse>>
    {
        public string? businessUnitCode { get; set; }

        /// <summary>
        /// 1 = Month to Date
        /// 2 = Year to Date
        /// </summary>
        [DefaultValue(1)]
        public int period { get; set; } = (int)Period.MonthToDate;
    }

    public enum Period
    {
        MonthToDate = 1,
        YearToDate = 2,
    }
}