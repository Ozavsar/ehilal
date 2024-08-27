export default async function Blog({
  params: { title },
}: {
  params: { title: string };
}) {
  const page = await fetch(
    `https://medium.com/@Elifhilalumucu/i%CC%87ngilizce-%C3%B6%C4%9Frenme-yolculu%C4%9Fu-2d471b1ce728`,
  );
  const data = await page.text();
  console.log(data);
  return (
    <div>
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: data }} />
    </div>
  );
}
