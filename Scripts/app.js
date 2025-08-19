function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

// Sidebar toggle logic for Home/About
(function () {
    var allowedSections = ['home', 'utilizatori', 'categorii'];

    function isAllowedSection(sectionName) {
        return allowedSections.indexOf(sectionName) !== -1;
    }

    function showSection(sectionName) {
        var sections = document.querySelectorAll('.section');
        for (var i = 0; i < sections.length; i++) {
            sections[i].classList.remove('active');
        }
        var target = document.querySelector('.' + sectionName);
        if (target) {
            target.classList.add('active');
        }

        var links = document.querySelectorAll('.sidebar a');
        for (var j = 0; j < links.length; j++) {
            links[j].classList.remove('active');
            if (links[j].getAttribute('data-section') === sectionName) {
                links[j].classList.add('active');
            }
        }

        updateTopnavActive();
    }

    function handleClick(e) {
        var section = this.getAttribute('data-section');
        if (!section) return;
        e.preventDefault();
        showSection(section);
        if (history && history.replaceState) {
            history.replaceState(null, '', '#' + section);
            updateTopnavActive();
        } else {
            location.hash = section;
        }
    }

    function updateTopnavActive() {
        var topLinks = document.querySelectorAll('.topnav a');
        var currentHash = location.hash || '#home';
        for (var k = 0; k < topLinks.length; k++) {
            topLinks[k].classList.remove('active');
            if (topLinks[k].getAttribute('href') === currentHash) {
                topLinks[k].classList.add('active');
            }
        }
    }

    function init() {
        var links = document.querySelectorAll('.sidebar a');
        for (var i = 0; i < links.length; i++) {
            var isToggle = links[i].classList.contains('sidebar-toggle');
            if (!isToggle) {
                links[i].addEventListener('click', handleClick);
            }
        }

        var toggle = document.querySelector('.sidebar .sidebar-toggle');
        var sidebar = document.getElementById('sidebar');
        var content = document.querySelector('.content');
        if (toggle && sidebar && content) {
            toggle.addEventListener('click', function (e) {
                e.preventDefault();
                // Add fade transition by toggling a fading class briefly
                sidebar.classList.add('fading');
                sidebar.classList.toggle('collapsed');
                content.classList.toggle('expanded-when-collapsed');
                setTimeout(function () {
                    sidebar.classList.remove('fading');
                }, 250);
            });
        }

        var initial = (location.hash || '#home').replace('#', '');
        if (!isAllowedSection(initial)) {
            initial = 'home';
        }
        showSection(initial);
        updateTopnavActive();

        window.addEventListener('hashchange', function () {
            var hash = (location.hash || '').replace('#', '');
            updateTopnavActive();
            if (isAllowedSection(hash)) {
                showSection(hash);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();