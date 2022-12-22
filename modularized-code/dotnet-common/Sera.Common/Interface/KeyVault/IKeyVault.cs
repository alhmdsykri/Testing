namespace Sera.Common.Interface.KeyVault
{
    public interface IKeyVault
    {
        Task<string> GetSecretAsync(string secretName);
        string GetSecret(string secretName);
    }
}
