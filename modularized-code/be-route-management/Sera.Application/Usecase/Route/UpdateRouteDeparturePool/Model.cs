namespace Sera.Application.Usecase;

public class GetLocation
{
	public int locationId { get; set; }
	public string LocationName { get; set; }
	public int? BusinessUnitId { get; set; }
	public string? BusinessUnitCode { get; set; }
	public string? BusinessUnitName { get; set; }
	public int? BranchId { get; set; }
	public string? BranchCode { get; set; }
	public string? BranchName { get; set; }
	public int LocationTypeId { get; set; }
	public string LocationTypeCode { get; set; }
	public string LocationTypeName { get; set; }
}