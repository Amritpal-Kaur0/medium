import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'

//environment variables type set for hono 
const app = new Hono<{
  Bindings:{
    DATABASE_URL:string
    JWT_SECRET:string
  }
}>()




//POST /api/v1/signup
app.post('api/v1/signup',async (c) => {
  console.log("hi there 1");
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());
    const body = await c.req.json();
    console.log("hi there 2");
    
    try {
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: body.password
        }
      });
    
      return c.text('jwt here')
    } catch(e) {
      return c.status(403);
    }
  })
  
//POST /api/v1/signin
app.post('/api/v1/signin',async (c) => {

  const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const user = await prisma.user.findUnique({
		where: {
			email: body.email,
      password:body.password
		}
	});
  if (!user) {
		c.status(403);
		return c.json({ error: "user not found" });
	}

	const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
	return c.json({ jwt });

})

//POST /api/v1/blog
app.post('/api/v1/blog', (c) => {
  return c.text('post blog Hono!')
})

//PUT /api/v1/blog
app.put('/api/v1/blog', (c) => {
  return c.text('edit blog Hono!')
})

//GET /api/v1/blog/:id
app.get('/api/v1/blog/:id', (c) => {
  const id = c.req.param('id');
  console.log(id);
  
  return c.text('get blog by id  Hono!')
})




export default app
