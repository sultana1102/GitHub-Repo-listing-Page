    var isFirstLoad = true;
    var perPage = 10;
    var pageNumber = 1;
    var TotalPageCount = 0;
    var TotalPages = 0;
    var isFetching = true;
    var username = '';

    function createTopics(topics) {
        var topicTemplate = '';
        topics.forEach(topic => {
            debugger;
            topicTemplate = topicTemplate +  `<a href="#" class="card-link mx-2">${topic}</a>`
        }); 
        return topicTemplate;
    }

    function createCard(repo) {
        var cardTemplate =
            `<div class= "col-md-6 col-sm-12 col-lg-4" >
            <div class="card-body">
                <h5 class="card-title text-primary fs-6">${repo.name}</h5>
                <p class="card-text mt-2">${repo.description || ''}</p>
                ${createTopics(repo.topics)}
                 </div>
        </div >`
        return $(cardTemplate);
    }

    function createUserCard(user) {
        var userTemplate = 
            `<div class="col-md-6 col-sm-12 col-lg-6 user-details d-flex">
                
                <div class="card-body my-4 row">
                    <div class="col-4">
                    <img class="card-img-top my-4" src=${user.avatar_url} alt="Card image" style="width:100%">
                    </div>
                    <div class="col-8 mt-4">
                    <h4 class="card-title">${user.name}</h4>
                    <p>${user.bio}</p>
                    <p>Location: ${user.location}</p>
                    <p>Twitter: ${user.twitter_username || 'Not Available'}</p>
                    </div>
                </div>
            </div>`
        return $(userTemplate);
    }

    function createPage(pageNo) {
        var pageTemplate =
            `<li class="page-item"><a class="page-link" href="#" id="page-${pageNo}">${pageNo}</a></li>`
        return $(pageTemplate);
    }

    function handleCssClasses() {
        if (pageNumber == 1) {
            $("#page-previous").addClass('disabled');
        }

        if (pageNumber == TotalPages) {
            $("#page-Next").addClass('disabled');
        }

        $(`#page-${pageNumber}`).addClass('active');

    }


    function renderPagination() {
        var pages = $();
        var i = 0;

        pages = pages.add(createPage('previous'));
        while (i < TotalPages) {
            pages = pages.add(createPage(i + 1));
            i++;
        }
        pages = pages.add(createPage('Next'));
        $('#pagination').html(pages);
        handleCssClasses();
    }

    function getUser() {
        var fetchUrl = `https://api.github.com/users/${username}`;

        fetch(fetchUrl).then(function (res) {
            debugger;
            if (!res.ok) {
                $('#user-container').hide();
                return;
            }
            return res.json();
        }).then(userDetails => {
            var user = $();
            user = createUserCard(userDetails);
            $('#user-container').html(user);
            $('#user-container').show();
        })

    }

    function renderRepos() {
        $("#repositories-container").hide();
        $("#loader").show();

        var fetchUrl = `https://api.github.com/users/${username}/repos`;
        fetchUrl = isFirstLoad ? fetchUrl : `${fetchUrl}?page=${pageNumber}&per_page=${perPage}`;

        fetch(fetchUrl).then(function (res) {
            debugger;
            if (!res.ok) {
                $("#invalid-user").show();
                $("#loader").hide();
                $("#repositories-container").hide();
                return;
            }
            return res.json();
        }).then(repositories => {
            if (!repositories) return;
            debugger;
            $("#loader").hide();
            $("#repositories-container").show();
            $("#invalid-user").hide();

            var repos = $();
            if (isFirstLoad) {
                TotalPageCount = repositories.length;
                // TotalPageCount = 0;
                TotalPages = Math.ceil(TotalPageCount / perPage);
                repositories = repositories.slice(0, perPage);
            }

            if (TotalPageCount) {
                repositories.forEach(function (item, i) {
                    repos = repos.add(createCard(item));
                });
                // Add them to the page... for instance the <body>
                $(function () {
                    $('#repositories').html(repos);
                });
                renderPagination()
            }
        })
    }

    $(document).ready(function () {
        $("#loader").hide();
        $("#invalid-user").hide();


        $('#username').change(function () {
            username = event.target.value;
        });

        $('#btn-find-repositories').click(function () {
            if (username) {
                getUser();
                renderRepos();
            }
        });
        $("#pagination").click(function () {
            debugger;
            var selectedPage = event.target.text;
            if (!selectedPage) {
                return;
            }

            if (selectedPage == 'Next' && pageNumber < TotalPages) {
                pageNumber = Number(pageNumber) + 1;
            } else if (selectedPage === 'previous' && pageNumber > 0) {
                pageNumber = Number(pageNumber) - 1;
            } else {
                pageNumber = Number(selectedPage);
            }
            renderRepos();
        });


    });

