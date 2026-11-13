async function test() {
    const res = await fetch('https://brunxind.com/moletom-canguru-streetwear-2-cabos-brunx-ind-preto-16090010001/p');
    console.log('STATUS:', res.status, res.url);
    if (res.status === 200) {
        const html = await res.text();
        const imgs = [...html.matchAll(/https:\/\/s\.brunxind\.com\/[^"']+\.(?:jpg|png|webp)/gi)].map(m => m[0]);
        console.log('IMGS:', [...new Set(imgs)]);
    }
}
test();
