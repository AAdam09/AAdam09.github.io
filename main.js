const canvas = document.getElementById("box");
const ctx = canvas.getContext("2d");
const more = document.getElementById("hidden");
const toggleButton = document.getElementById("more")
let iShowMore = false;

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

function createBall() {
    let radius = 10 + Math.random() * 25;
    let hue = Math.random() * 360;

    return {
        r: radius,
        x: radius + Math.random() * (canvas.width - 2 * radius),
        y: radius + Math.random() * (canvas.height - 2 * radius),
        vx: Math.random() * 250,
        vy: Math.random() * 250,
        hue: hue,
        color: "hsl(" + hue + ", 100%, 50%)"
    };
}

var balls = [];

for (let i = 0; i < 10; i++) {
    balls.push(createBall());
}

var particles = [];

function createExplosion(x, y, color) {
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 300,
            vy: (Math.random() - 0.5) * 300,
            life: 80,
            color: color
        })
    }
}

//Spike ball variables
var spikeRadius = 20 + Math.random() * 15;
var spikeX = spikeRadius + Math.random() * (canvas.width - 2 * spikeRadius);
var spikeY = spikeRadius + Math.random() * (canvas.height - 2 * spikeRadius);
var spikeVX = 150;
var spikeVY = 150;
var spikeAngle = 0;
let canDrawSpikeBall = false;

function drawSpikeBall(ctx, x, y, size) {
    ctx.beginPath();

    for (let i = 0; i < 3; i++) {
        let angle = -Math.PI / 2 + i * (2 * Math.PI / 3);  
        let px = x + size * Math.cos(angle);
        let py = y + size * Math.sin(angle);

        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }

    ctx.closePath();
    ctx.fill();
}

function draw_move() {
    ctx.clearRect(0,0,canvas.width, canvas.height);

    for (let ball of balls) {
        //Move
        ball.x += ball.vx / 60;
        ball.y += ball.vy / 60;

        //Ball collision
        for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                let b1 = balls[i];
                let b2 = balls[j];

                let dx = b2.x - b1.x;
                let dy = b2.y - b1.y;

                let distance = Math.sqrt(dy*dy + dx*dx);
                let minDistance = b1.r + b2.r;

                if (distance < minDistance) {
                    let nx = dx / distance;
                    let ny = dy / distance;

                    let overlap = minDistance - distance;
                    b1.x -= nx * overlap / 2;
                    b1.y -= ny * overlap / 2;
                    b2.x += nx * overlap / 2;
                    b2.y += ny * overlap / 2;
                    
                    let tx = b1.vx;
                    let ty = b1.vy;

                    b1.vx = b2.vx;
                    b1.vy = b2.vy;

                    b2.vx = tx;
                    b2.vy = ty;
                };
            };
        }
        // Wall collision
        if (ball.x - ball.r < 0) {
            ball.x = ball.r;
            ball.vx = -ball.vx;
        }

        if (ball.x + ball.r > canvas.width) {
            ball.x = canvas.width - ball.r;
            ball.vx = -ball.vx;
        }

        if (ball.y - ball.r < 0) {
            ball.y = ball.r;
            ball.vy = -ball.vy;
        }

        if (ball.y + ball.r > canvas.height) {
            ball.y = canvas.height - ball.r;
            ball.vy = -ball.vy;
        }

        
        //Draw balls
        ball.hue += 1;
        ball.color = "hsl(" + ball.hue + ", 100%, 50%)";
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x,ball.y,ball.r,0,2*Math.PI);
        ctx.fill();
    }

    //Draw particles
    for (let i = particles.length - 1; i >= 0; i--) {

        let p = particles[i];
    
        p.x += p.vx / 60;
        p.y += p.vy / 60;
        p.life--;
    
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4);
    
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    //Spike Ball collisions
    balls = balls.filter(ball => {
        let dx = ball.x - spikeX;
        let dy = ball.y - spikeY;

        let distance = Math.sqrt(dy*dy + dx*dx);
        if (canDrawSpikeBall == true && distance < ball.r + 5) {
            createExplosion(ball.x, ball.y, ball.color);
            return false;
        }

        return true;
    })

    //Spike Ball Physics
    if (spikeX + spikeRadius > canvas.width || spikeX - spikeRadius < 0) {
        spikeVX = -spikeVX;
    }

    if (spikeY + spikeRadius > canvas.height || spikeY - spikeRadius < 0) {
        spikeVY = -spikeVY;
    }

    spikeX += spikeVX / 60;
    spikeY += spikeVY / 60;

    spikeAngle += 0.5;
    
    //Spiked ball spin and draw
    if (canDrawSpikeBall == true) {
        ctx.save();
        ctx.translate(spikeX, spikeY);
        ctx.rotate(spikeAngle);

        ctx.fillStyle = "black";
        drawSpikeBall(ctx, 0, 0, spikeRadius);

        ctx.restore();
        drawSpikeBall == false;
    }

    requestAnimationFrame(draw_move);
}

let currentSlide = 0;

function moveSlider(direction) {
    const slider = document.getElementById('slider');
    const totalSlides = slider.children.length;

    currentSlide += direction;

    if (currentSlide >= totalSlides) {
        currentSlide = 0;
    }
    if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    }

    slider.style.transform = `translateX(calc(-${currentSlide * 100}% - ${currentSlide * 4}rem))`;
}

window.addEventListener("resize", function() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
});

window.addEventListener("click", function(event) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top

    balls = balls.filter(ball => {
        let dx = ball.x - mouseX;
        let dy = ball.y - mouseY;

        let distance = Math.sqrt(dy*dy + dx*dx);
        if (distance < ball.r + 5) {
            createExplosion(ball.x, ball.y, ball.color);
            return false;
        }

        return true;
    })
})

document.getElementById("addBall").addEventListener("click", function() {
    balls.push(createBall());
})

document.getElementById("addSpikeBall").addEventListener("click", function() {
    if (canDrawSpikeBall == true) {
        canDrawSpikeBall = false;
    }
    else {
        canDrawSpikeBall = true;
    }
})

document.getElementById("ballButton").addEventListener("click", function() {
    balls = []
    for (let i = 0; i < 10; i++) {
        balls.push(createBall());
    }
})

toggleButton.addEventListener("click", ()=> {
    iShowMore = !iShowMore;

    if (iShowMore) {
        more.style.display = "block";
        toggleButton.textContent = "Read Less";
    }
    else {
        more.style.display = "none";
        toggleButton.textContent = "Read More";
    }
})

document.querySelectorAll('.folder-header').forEach(button => {
    button.addEventListener('click', () => {
        // Finds the parent folder, then finds the content div inside it
        const folder = button.closest('.project-folder');
        const content = folder.querySelector('.folder-content');
        
        // Toggles the open class
        content.classList.toggle('closed');
        
        // Rotates the arrow indicator icon cleanly
        const arrow = button.querySelector('.arrow-icon');
        if (content.classList.contains('closed')) {
            arrow.style.transform = 'rotate(180deg)';
        } else {
            arrow.style.transform = 'rotate(0deg)';
        }
    });
});

draw_move();

