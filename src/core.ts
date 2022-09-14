import {debugPrintf, Inputs, Outputs} from "./main";
import {EdgeAddonsAPI} from "./api";

export function run(input: Inputs): Outputs {
    const client = new EdgeAddonsAPI({
        productId: input.product_id,
        clientId: input.client_id,
        clientSecret: input.client_secret,
        accessTokenUrl: input.access_token_url
    })
    client.submit({
        filePath: input.addone_file,
        notes: input.notes
    }).then(debugPrintf).catch(debugPrintf);
    return {};
}
