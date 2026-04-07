using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program {
    static async Task Main() {
        var client = new HttpClient();
        var json = "{\"bookingId\": 1, \"userId\": null, \"roomAmount\": 1800000, \"serviceAmount\": 500000, \"damagedItemsFee\": 0, \"discountAmount\": 0, \"isBlacklisted\": false}";
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await client.PostAsync("http://localhost:5291/api/Checkout/process", content);
        var responseString = await response.Content.ReadAsStringAsync();
        Console.WriteLine((int)response.StatusCode);
        Console.WriteLine(responseString);
    }
}
