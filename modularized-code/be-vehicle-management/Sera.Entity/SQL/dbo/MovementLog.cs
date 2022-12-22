namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("MovementLog", Schema = "dbo")]
    public partial class MovementLog
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int movementLogId { get; set; }
        public int vehicleId { get; set; }
        public int movementTypeId { get; set; }
        public string movementTypeName { get; set; }
        public DateTime movementStartDate { get; set; }
        public DateTime movementEndDate { get; set; }
        public int referenceTypeId { get; set; }
        public string referenceTypeName { get; set; }
        public string referenceNumber { get; set; }
        public int requestorId { get; set; }
        public string requestorName { get; set; }
        public int approverId { get; set; }
        public string approverName { get; set; }
        public string source { get; set; }
        public string fromAddress { get; set; }
        public int fromBusinessUnitId { get; set; }
        public string fromBusinessUnitCode { get; set; }
        public string fromBusinessUnitName { get; set; }
        public int fromBranchId { get; set; }
        public string fromBranchCode { get; set; }
        public string fromBranchName { get; set; }
        public string toAddress { get; set; }
        public int toBusinessUnitId { get; set; }
        public string toBusinessUnitCode { get; set; }
        public string toBusinessUnitName { get; set; }
        public int toBranchId { get; set; }
        public string toBranchCode { get; set; }
        public string toBranchName { get; set; }
        public int status { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }
        public int version { get; set; }
        public string uniqueKey { get; set; }
    }
}